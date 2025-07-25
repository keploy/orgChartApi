/**
 *
 *  User.h
 *  DO NOT EDIT. This file is generated by drogon_ctl
 *
 */

#pragma once
#include <drogon/orm/Result.h>
#include <drogon/orm/Row.h>
#include <drogon/orm/Field.h>
#include <drogon/orm/SqlBinder.h>
#include <drogon/orm/Mapper.h>
#ifdef __cpp_impl_coroutine
#include <drogon/orm/CoroMapper.h>
#endif
#include <trantor/utils/Date.h>
#include <trantor/utils/Logger.h>
#include <json/json.h>
#include <string>
#include <memory>
#include <vector>
#include <tuple>
#include <stdint.h>
#include <iostream>

namespace drogon
{
    namespace orm
    {
        class DbClient;
        using DbClientPtr = std::shared_ptr<DbClient>;
    }
}
namespace drogon_model
{
    namespace org_chart
    {

        class User
        {
        public:
            struct Cols
            {
                static const std::string _id;
                static const std::string _username;
                static const std::string _password;
            };

            const static int primaryKeyNumber;
            const static std::string tableName;
            const static bool hasPrimaryKey;
            const static std::string primaryKeyName;
            using PrimaryKeyType = int32_t;
            const PrimaryKeyType &getPrimaryKey() const;

            /**
             * @brief constructor
             * @param r One row of records in the SQL query result.
             * @param indexOffset Set the offset to -1 to access all columns by column names,
             * otherwise access all columns by offsets.
             * @note If the SQL is not a style of 'select * from table_name ...' (select all
             * columns by an asterisk), please set the offset to -1.
             */
            explicit User(const drogon::orm::Row &r, const ssize_t indexOffset = 0) noexcept;

            /**
             * @brief constructor
             * @param pJson The json object to construct a new instance.
             */
            explicit User(const Json::Value &pJson) noexcept(false);

            /**
             * @brief constructor
             * @param pJson The json object to construct a new instance.
             * @param pMasqueradingVector The aliases of table columns.
             */
            User(const Json::Value &pJson, const std::vector<std::string> &pMasqueradingVector) noexcept(false);

            User() = default;

            void updateByJson(const Json::Value &pJson) noexcept(false);
            void updateByMasqueradedJson(const Json::Value &pJson,
                                         const std::vector<std::string> &pMasqueradingVector) noexcept(false);
            static bool validateJsonForCreation(const Json::Value &pJson, std::string &err);
            static bool validateMasqueradedJsonForCreation(const Json::Value &,
                                                           const std::vector<std::string> &pMasqueradingVector,
                                                           std::string &err);
            static bool validateJsonForUpdate(const Json::Value &pJson, std::string &err);
            static bool validateMasqueradedJsonForUpdate(const Json::Value &,
                                                         const std::vector<std::string> &pMasqueradingVector,
                                                         std::string &err);
            static bool validJsonOfField(size_t index,
                                         const std::string &fieldName,
                                         const Json::Value &pJson,
                                         std::string &err,
                                         bool isForCreation);

            /**  For column id  */
            /// Get the value of the column id, returns the default value if the column is null
            const int32_t &getValueOfId() const noexcept;
            /// Return a shared_ptr object pointing to the column const value, or an empty shared_ptr object if the column is null
            const std::shared_ptr<int32_t> &getId() const noexcept;
            /// Set the value of the column id
            void setId(const int32_t &pId) noexcept;

            /**  For column username  */
            /// Get the value of the column username, returns the default value if the column is null
            const std::string &getValueOfUsername() const noexcept;
            /// Return a shared_ptr object pointing to the column const value, or an empty shared_ptr object if the column is null
            const std::shared_ptr<std::string> &getUsername() const noexcept;
            /// Set the value of the column username
            void setUsername(const std::string &pUsername) noexcept;
            void setUsername(std::string &&pUsername) noexcept;

            /**  For column password  */
            /// Get the value of the column password, returns the default value if the column is null
            const std::string &getValueOfPassword() const noexcept;
            /// Return a shared_ptr object pointing to the column const value, or an empty shared_ptr object if the column is null
            const std::shared_ptr<std::string> &getPassword() const noexcept;
            /// Set the value of the column password
            void setPassword(const std::string &pPassword) noexcept;
            void setPassword(std::string &&pPassword) noexcept;

            static size_t getColumnNumber() noexcept { return 3; }
            static const std::string &getColumnName(size_t index) noexcept(false);

            Json::Value toJson() const;
            Json::Value toMasqueradedJson(const std::vector<std::string> &pMasqueradingVector) const;
            /// Relationship interfaces
        private:
            friend drogon::orm::Mapper<User>;
#ifdef __cpp_impl_coroutine
            friend drogon::orm::CoroMapper<User>;
#endif
            static const std::vector<std::string> &insertColumns() noexcept;
            void outputArgs(drogon::orm::internal::SqlBinder &binder) const;
            const std::vector<std::string> updateColumns() const;
            void updateArgs(drogon::orm::internal::SqlBinder &binder) const;
            /// For mysql or sqlite3
            void updateId(const uint64_t id);
            std::shared_ptr<int32_t> id_;
            std::shared_ptr<std::string> username_;
            std::shared_ptr<std::string> password_;
            struct MetaData
            {
                const std::string colName_;
                const std::string colType_;
                const std::string colDatabaseType_;
                const ssize_t colLength_;
                const bool isAutoVal_;
                const bool isPrimaryKey_;
                const bool notNull_;
            };
            static const std::vector<MetaData> metaData_;
            bool dirtyFlag_[3] = {false};

        public:
            static const std::string &sqlForFindingByPrimaryKey()
            {
                static const std::string sql = "select * from " + tableName + " where id = $1";
                return sql;
            }

            static const std::string &sqlForDeletingByPrimaryKey()
            {
                static const std::string sql = "delete from " + tableName + " where id = $1";
                return sql;
            }
            std::string sqlForInserting(bool &needSelection) const
            {
                std::string sql = "INSERT INTO " + tableName + " (";
                size_t parametersCount = 0;

                // Build column list ---------------------------------------------------
                if (dirtyFlag_[1]) // username
                {
                    sql += "username,";
                    ++parametersCount;
                }
                if (dirtyFlag_[2]) // password
                {
                    sql += "`password`,";
                    ++parametersCount;
                }

                // Replace trailing comma with ')' and open VALUES ---------------------
                if (parametersCount > 0)
                {
                    sql.back() = ')';
                    sql += " VALUES (";
                }
                else
                {
                    sql += ") VALUES (";
                }

                // Add ? placeholders in the same order --------------------------------
                if (dirtyFlag_[1])
                    sql += "?,";
                if (dirtyFlag_[2])
                    sql += "?,";

                // Strip final comma and close VALUES ----------------------------------
                if (sql.back() == ',')
                    sql.back() = ')';
                else
                    sql += ')';

                needSelection = false; // no RETURNING for MySQL
                LOG_TRACE << sql;
                return sql;
            }
        };
    } // namespace org_chart
} // namespace drogon_model
