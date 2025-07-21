#include "controllers/DepartmentsController.h"
#include <drogon/HttpAppFramework.h>
#include <drogon/HttpRequest.h>
#include <json/json.h>
#include <iostream>

// This is the main entry point for the fuzzer
extern "C" int LLVMFuzzerTestOneInput(const uint8_t *Data, size_t Size) {
    static bool is_initialized = []() -> bool {
        try {
            drogon::app().disableSession();
            drogon::app().setLogLevel(trantor::Logger::kError);
            drogon::app().loadConfigFile("config.json");
            std::cout << "Drogon configured for fuzzing with in-memory SQLite database." << std::endl;

        } catch (const std::exception& e) {
            // If this fails, the harness is misconfigured.
            std::cerr << "!!! HARNESS INITIALIZATION FAILED: " << e.what() << std::endl;
            abort();
        }
        return true;
    }();
    // --- End of Initialization ---

    if (Size < 1) {
        return 0;
    }

    DepartmentsController controller;
    uint8_t selector = Data[0];
    const uint8_t* payload = Data + 1;
    size_t payload_size = Size - 1;

    try {
        switch (selector % 2) {
            case 0: { // Fuzz createOne
                if (payload_size < 2) break;
                Json::Value json_body;
                Json::Reader reader;
                std::string input_string(reinterpret_cast<const char*>(payload), payload_size);
                if (reader.parse(input_string, json_body)) {
                    Department department_to_create(json_body);
                    auto req = drogon::HttpRequest::newHttpJsonRequest(json_body);
                    auto cb = [](const drogon::HttpResponsePtr &){};
                    controller.createOne(req, std::move(cb), std::move(department_to_create));
                }
                break;
            }
            case 1: { // Fuzz getOne
                if (payload_size == 0) break;
                int departmentId = 0;
                size_t bytes_to_copy = std::min(payload_size, sizeof(int));
                memcpy(&departmentId, payload, bytes_to_copy);
                auto req = drogon::HttpRequest::newHttpRequest();
                auto cb = [](const drogon::HttpResponsePtr &){};
                controller.getOne(req, std::move(cb), departmentId);
                break;
            }
        }
    } catch (const std::exception &e) {
        // Correctly catch exceptions from business logic.
    }

    return 0;
}
