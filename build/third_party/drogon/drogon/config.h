#pragma once

#define USE_POSTGRESQL 1
#define LIBPQ_SUPPORTS_BATCH_MODE 0
#define USE_MYSQL 1
#define USE_SQLITE3 1
#define HAS_STD_FILESYSTEM_PATH 1
#define OpenSSL_FOUND
/* #undef Boost_FOUND */

#define COMPILATION_FLAGS "-std=c++17"
#define COMPILER_COMMAND "/usr/bin/c++"
#define COMPILER_ID "GNU"

#define INCLUDING_DIRS " -I/usr/include/jsoncpp -I/usr/local/include"
