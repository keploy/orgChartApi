#pragma once

#include <drogon/drogon.h>
#include <drogon/orm/DbClient.h>
#include <string>

void badRequest (
    std::function<void(const drogon::HttpResponsePtr &)> &&callback,
    std::string err,
    drogon::HttpStatusCode code = drogon::k400BadRequest
);

Json::Value makeErrResp(std::string err);


inline bool rowExists(const drogon::orm::DbClientPtr& db,
                      const std::string& table,
                      uint64_t id)
{
    try
    {
        // The sync API is simplest here
        drogon::orm::Result r =
            db->execSqlSync("SELECT 1 FROM " + table + " WHERE id = ?", id);

        return !r.empty();
    }
    catch (const drogon::orm::DrogonDbException&)
    {
        // On any SQL error treat it as “doesn’t exist”
        return false;
    }
}


inline bool personNameExists(const drogon::orm::DbClientPtr& db,
                             const std::string& first,
                             const std::string& last,
                             int64_t           excludeId = -1)
{
    std::string sql =
        "SELECT 1 FROM person WHERE first_name = ? AND last_name = ?";
    if (excludeId >= 0)
        sql += " AND id <> ?";

    try {
        auto r = excludeId < 0
                   ? db->execSqlSync(sql, first, last)
                   : db->execSqlSync(sql, first, last, excludeId);
        return !r.empty();
    }
    catch (const drogon::orm::DrogonDbException&) {
        /* On any DB error, be conservative – say it exists so we bail out
           before MySQL can throw 1062 later. */
        return true;
    }
}