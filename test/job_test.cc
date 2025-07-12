#include <gtest/gtest.h>
#include <gmock/gmock.h>
#include <drogon/HttpController.h>
#include <drogon/orm/DbClient.h>
#include <memory>
#include <functional>
#include <string>
#include "../models/Job.h"
#include "../controllers/JobsController.h"

using namespace testing;
using namespace drogon;
using namespace drogon_model::org_chart;

// Define the Callback type (assuming it expects a const HttpResponsePtr&)
using Callback = std::function<void(const HttpResponsePtr &)>;

// Mock DbClient to simulate database operations
class MockDbClient : public drogon::orm::DbClient
{
public:
    MOCK_METHOD(std::shared_ptr<drogon::orm::Transaction>, newTransaction, (const std::function<void(bool)> &), (override));
    MOCK_METHOD(void, newTransactionAsync, (const std::function<void(const std::shared_ptr<drogon::orm::Transaction> &)> &), (override));
    MOCK_METHOD(bool, hasAvailableConnections, (), (const, noexcept, override)); // <-- Add noexcept
    MOCK_METHOD(void, setTimeout, (double timeout), (override));
    MOCK_METHOD(void, execSql, (const char *sql, size_t len, size_t timeout, std::vector<const char *> &&params, std::vector<int> &&types, std::vector<int> &&lengths, ResultCallback &&callback, std::function<void(const std::exception_ptr &)> &&errCallback),
                (override));
};

// Define the equality operator for Job class (if not already defined)
bool operator==(const Job &lhs, const Job &rhs)
{
    // Use public getters instead of direct member access
    return lhs.getId() == rhs.getId() && lhs.getTitle() == rhs.getTitle(); // Add more fields as necessary
}

// Mock the JobsController for testing
class JobsControllerTest : public ::testing::Test
{
protected:
    std::shared_ptr<MockDbClient> mockDbClient;
    std::shared_ptr<JobsController> controller;

    void SetUp() override
    {
        mockDbClient = std::make_shared<MockDbClient>();
        controller = std::make_shared<JobsController>(mockDbClient); // Initialize with mock DbClient
    }
};

// Test case to verify findAll behavior
TEST_F(JobsControllerTest, TestFindAll)
{
    auto req = HttpRequest::newHttpRequest();
    auto callback = [](const HttpResponsePtr &response)
    {
        EXPECT_TRUE(response != nullptr);
    };

    EXPECT_CALL(*mockDbClient, execSql(_, _, _, _, _, _, _, _))
        .WillOnce(Invoke([&](const char *, size_t, size_t,
                             std::vector<const char *> &&,
                             std::vector<int> &&,
                             std::vector<int> &&,
                             ResultCallback &&,
                             std::function<void(const std::exception_ptr &)> &&)
                         {
                             HttpResponsePtr mockResponse = HttpResponse::newHttpResponse();
                             callback(mockResponse);
                         }));

    controller->get(req, callback); // Pass valid request and callback
}

// Test case to verify insert behavior
TEST_F(JobsControllerTest, TestInsert)
{
    Job job;
    job.setId(1);
    job.setTitle("Software Engineer");

    auto req = HttpRequest::newHttpRequest();
    auto callback = [](const HttpResponsePtr &response)
    {
        EXPECT_TRUE(response != nullptr);
    };

    EXPECT_CALL(*mockDbClient, execSql(_, _, _, _, _, _, _, _))
        .WillOnce(Invoke([&](const char *, size_t, size_t,
                             std::vector<const char *> &&,
                             std::vector<int> &&,
                             std::vector<int> &&,
                             ResultCallback &&,
                             std::function<void(const std::exception_ptr &)> &&)
                         {
                             HttpResponsePtr mockResponse = HttpResponse::newHttpResponse();
                             callback(mockResponse);
                         }));

    controller->createOne(req, callback, std::move(job)); // Pass valid request and callback
}

// Main test entry point
int main(int argc, char **argv)
{
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
