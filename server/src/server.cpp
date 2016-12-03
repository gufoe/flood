#include <redox.hpp>
#include <iostream>
#include <uWS.h>
#include <cstdint>
#include <vector>
#include <cmath>
#include <cstdlib>

#include "h/json.hpp"
#include "h/types.hpp"
#include "h/const.hpp"

using namespace std;
using namespace redox;
using namespace nlohmann;

Redox redis;

bool init_redis() {
	return redis.connect("localhost", 6379);
}

lli_t subject_count() {
	Command<lli_t>& c = redis.commandSync<lli_t>({"zcard", "subjects"});
	lli_t size = c.reply();
	c.free();
	return size;
}

void limit_pool(uint size = POOL_SIZE) {
	int overflow = subject_count()-size-1;
	if (overflow < 0) return;
	Command<lli_t>& c = redis.commandSync<lli_t>({"zremrangebyrank", "subjects", "0", std::to_string(overflow)});
	c.free();
}

void subject_push(double score, std::string subject) {
	Command<lli_t>& c = redis.commandSync<lli_t>({"zadd", "subjects", std::to_string(score), subject});
	c.free();
	limit_pool();
}

std::string subject_get(lli_t i) {
	string command = "zrange";
	Command<vector<string> >& c = redis.commandSync<vector<string> >({command, "subjects", to_string(i), to_string(i)});
	vector<string> subject = c.reply();
	c.free();
	return subject.size() ? subject[0] : "";
}

double subject_get_score(lli_t i) {
	string command = "zrange";
	Command<vector<string> >& c = redis.commandSync<vector<string> >({command, "subjects", to_string(i), to_string(i), "withscores"});
	vector<string> subject = c.reply();
	c.free();
	return subject.size() > 1 ? stod(subject[1]) : 0;
}

std::string subject_select() {
	double r = (double)rand()/RAND_MAX;
	int id = std::exp(r*std::log(subject_count()));
	return subject_get(-id);
}


void worker_add(uWS::WebSocket<uWS::CLIENT> ws, uWS::UpgradeInfo ui) {
	#ifdef DEBUG
	cout << "new worker connection\n";
	#endif
}

void worker_rec(uWS::WebSocket<uWS::SERVER> ws, char *data, size_t length, uWS::OpCode opCode) {
	json message, res;
	string command;

	try {
		message = json::parse(string(data, length));
		command = message["command"];
		res["seq"] = message["seq"].get<int>();
	} catch(...) {
		std::cerr << "Invalid packet from worker." << '\n';
		return;
	}

	// #ifdef DEBUG
	// std::cout << "Received message: " << message << '\n';
	// #endif

	switch (command.length() ? command[0] : 0) {
	case CMD_PULL:
		res["subjects"] = vector<string>();
		for (uint32_t i = 0; i < 2; i++) {
			res["subjects"].push_back(subject_select());
		}
		ws.send(res.dump().c_str());
		return;
	case CMD_PUSH:
		if (!message["score"].is_number() || !message["subject"].is_string())
			break;
		subject_push(message["score"], message["subject"]);

		double last = message["score"];
		double best = subject_get_score(-1);
		double worst = subject_get_score(0);
		std::cout
			<< setw(8) << setprecision(8) << best   << " best  "
			<< setw(8) << setprecision(8) << worst  << " worst "
			<< setw(8) << setprecision(8) << last   << " last  "
			<< "\n";
		// std::cout << "best " << sprintf("%.3f", message["score"].get<float>());
		return;
	}

	res["error"] = "Invalid command. And fuck you.";
	ws.send(res.dump().c_str());
}

int main(int argc, const char **argv) {

	if (!init_redis()) {
		cerr << "Cannot connect to redis.\n";
		return 1;
	}

	if (argc == 2 && argv[1] == string("--new")) {
		cout << "Clearing pool...\n";
		limit_pool(0);
	}

	uWS::Hub hub;
	hub.onConnection(worker_add);
	hub.onMessage(worker_rec);
	hub.listen(9666);

	cout << "Listening for connections...\n";
	hub.run();
}
