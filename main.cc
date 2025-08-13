#include <drogon/drogon.h>
int main() {
    
    std::this_thread::sleep_for(std::chrono::seconds(5));

    LOG_DEBUG << "Load config file";
    drogon::app().loadConfigFile("../config.json");

    LOG_DEBUG << "running on localhost:3000";
    drogon::app().run();
    return 0;
}
