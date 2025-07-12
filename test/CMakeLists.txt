cmake_minimum_required(VERSION 3.5)
project(org_chart_test CXX)

add_executable(${PROJECT_NAME} job_test.cc ../models/Job.cc ../controllers/JobsController.cc ../models/Person.cc ../models/Department.cc ../utils/utils.cc)


if (COVERAGE MATCHES "ON") # Or any build type you use for coverage
    message(STATUS "Enabling code coverage flags for tests")
    target_compile_options(${PROJECT_NAME} PRIVATE --coverage)
    target_link_options(${PROJECT_NAME} PRIVATE --coverage)
endif()

target_link_libraries(${PROJECT_NAME} PRIVATE drogon GTest::gtest GTest::gmock)

ParseAndAddDrogonTests(${PROJECT_NAME})
