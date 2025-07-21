# cmake_minimum_required(VERSION 3.5)
# project(org_chart CXX)

# include(CheckIncludeFileCXX)

# check_include_file_cxx(any HAS_ANY)
# check_include_file_cxx(string_view HAS_STRING_VIEW)
# check_include_file_cxx(coroutine HAS_COROUTINE)
# if (NOT "${CMAKE_CXX_STANDARD}" STREQUAL "")
#     # Do nothing
# elseif (HAS_ANY AND HAS_STRING_VIEW AND HAS_COROUTINE)
#     set(CMAKE_CXX_STANDARD 20)
# elseif (HAS_ANY AND HAS_STRING_VIEW)
#     set(CMAKE_CXX_STANDARD 17)
# else ()
#     set(CMAKE_CXX_STANDARD 14)
# endif ()

# set(CMAKE_CXX_STANDARD_REQUIRED ON)
# set(CMAKE_CXX_EXTENSIONS OFF)

# add_executable(${PROJECT_NAME} main.cc)

# # Add these lines for coverage
# if (COVERAGE MATCHES "ON") # Or any build type you use for coverage
#     message(STATUS "Enabling code coverage flags")
#     target_compile_options(${PROJECT_NAME} PRIVATE --coverage)
#     target_link_options(${PROJECT_NAME} PRIVATE --coverage)
# endif()

# # ##############################################################################
# # https://github.com/drogonframework/drogon
# add_subdirectory(third_party/drogon)
# target_link_libraries(${PROJECT_NAME} PRIVATE drogon)

# # https://github.com/Thalhammer/jwt-cpp
# add_subdirectory(third_party/jwt-cpp)
# target_link_libraries(${PROJECT_NAME} PRIVATE jwt-cpp)

# # https://github.com/trusch/libbcrypt
# add_subdirectory(third_party/libbcrypt)
# target_link_libraries(${PROJECT_NAME} PRIVATE bcrypt)

# add_subdirectory(third_party/gtest)
# target_link_libraries(${PROJECT_NAME} PRIVATE gtest gtest_main)

# # and comment out the following lines
# find_package(Drogon CONFIG REQUIRED)
# target_link_libraries(${PROJECT_NAME} PRIVATE Drogon::Drogon)

# # ##############################################################################

# if (CMAKE_CXX_STANDARD LESS 17)
#     # With C++14, use boost to support any, string_view and filesystem
#     message(STATUS "use c++14")
#     find_package(Boost 1.61.0 REQUIRED)
#     target_link_libraries(${PROJECT_NAME} PUBLIC Boost::boost)
# elseif (CMAKE_CXX_STANDARD LESS 20)
#     message(STATUS "use c++17")
# else ()
#     message(STATUS "use c++20")
# endif ()

# aux_source_directory(controllers CTL_SRC)
# aux_source_directory(filters FILTER_SRC)
# aux_source_directory(plugins PLUGIN_SRC)
# aux_source_directory(models MODEL_SRC)
# aux_source_directory(utils UTIL_SRC)

# target_include_directories(${PROJECT_NAME}
#                            PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}
#                                    ${CMAKE_CURRENT_SOURCE_DIR}/models)
# target_sources(${PROJECT_NAME}
#                PRIVATE
#                ${SRC_DIR}
#                ${CTL_SRC}
#                ${FILTER_SRC}
#                ${PLUGIN_SRC}
#                ${MODEL_SRC}
#                ${UTIL_SRC})
# # ##############################################################################
# # uncomment the following line for dynamically loading views
# # set_property(TARGET ${PROJECT_NAME} PROPERTY ENABLE_EXPORTS ON)

# # ##############################################################################

# add_subdirectory(test)

# # add_executable(${PROJECT_NAME}_test test/test_main.cc)

# # target_link_libraries(${PROJECT_NAME}_test PRIVATE drogon)

# # ParseAndAddDrogonTests(${PROJECT_NAME}_test)
# # ===================================================================
# # AFL++ Fuzzer Target (add this entire block to the end of the file)
# # ===================================================================
# option(BUILD_FUZZER "Build the AFL++ fuzzer harness" ON)

# if(BUILD_FUZZER)
#   message(STATUS "Fuzzer build is enabled.")

#   # Force the use of the AFL++ compiler, overriding any external settings.
#   set(CMAKE_CXX_COMPILER "afl-clang-fast++" CACHE FILEPATH "AFL++ C++ compiler" FORCE)
#   set(CMAKE_C_COMPILER "afl-clang-fast" CACHE FILEPATH "AFL++ C compiler" FORCE)

#   # Define the fuzzer executable
#   add_executable(fuzz_harness harness.cpp)

#   # Link the fuzzer against your entire API project.
#   # This automatically handles ALL dependencies, source files, and libraries.
#   target_link_libraries(fuzz_harness PRIVATE org_chart)

#   # Add the FUZZING_BUILD definition and the fuzzer runtime linker flag
#   target_compile_definitions(fuzz_harness PRIVATE FUZZING_BUILD)
#   target_link_libraries(fuzz_harness PRIVATE -fsanitize=fuzzer)

#   message(STATUS "Configured fuzzer target. To build, run from your build directory: make fuzz_harness")
# endif()
cmake_minimum_required(VERSION 3.5)
project(org_chart CXX)

set(CMAKE_CXX_STANDARD 17)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

add_subdirectory(third_party/drogon)
add_subdirectory(third_party/jwt-cpp)
add_subdirectory(third_party/libbcrypt)
add_subdirectory(third_party/jsoncpp)

aux_source_directory(controllers CTL_SRC)
aux_source_directory(models MODEL_SRC)
aux_source_directory(utils UTIL_SRC)

add_library(org_chart_lib STATIC
    ${CTL_SRC}
    ${MODEL_SRC}
    ${UTIL_SRC}
)

target_link_libraries(org_chart_lib PRIVATE
    drogon
    jwt-cpp
    bcrypt
    jsoncpp_lib
)
target_include_directories(org_chart_lib PUBLIC
    ${CMAKE_CURRENT_SOURCE_DIR}
)
add_executable(${PROJECT_NAME} main.cc)
target_link_libraries(${PROJECT_NAME} PRIVATE org_chart_lib)

option(BUILD_FUZZER "Build the AFL++ fuzzer harness" ON)

if(BUILD_FUZZER)
    message(STATUS "Fuzzer build is enabled.")
    add_executable(fuzz_harness harness.cpp)

    target_link_libraries(fuzz_harness PRIVATE org_chart_lib)

    target_include_directories(fuzz_harness PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/third_party/drogon/lib/inc
        ${CMAKE_CURRENT_SOURCE_DIR}/third_party/drogon/orm_lib/inc
        ${CMAKE_CURRENT_SOURCE_DIR}/third_party/jsoncpp/include
    )
    target_link_options(fuzz_harness PRIVATE -fsanitize=fuzzer)

    target_compile_definitions(fuzz_harness PRIVATE FUZZING_BUILD)
    message(STATUS "Configured fuzzer target. To build, run: make fuzz_harness")
endif()