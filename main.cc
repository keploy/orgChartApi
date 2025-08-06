#include <drogon/drogon.h>
int main() {
    LOG_DEBUG << "Load config file";
    drogon::app().loadConfigFile("../config.json");

    LOG_DEBUG << "running on localhost:4000";
    drogon::app().run();
    return 0;
}