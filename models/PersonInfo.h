/**
 *  PersonInfo.h (MySQL-ready)
 *  NOTE: This class is a read-only view/DTO; it has no SQL-generation code
 *  so only the preamble comment is adjusted. Everything else remains intact.
 */

#pragma once
#include <drogon/orm/Result.h>
#include <drogon/orm/Row.h>
#include <drogon/orm/Field.h>
#include <drogon/orm/SqlBinder.h>
#include <drogon/orm/Mapper.h>
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
    class PersonInfo
    {
    public:
      explicit PersonInfo(const drogon::orm::Row &r, const ssize_t indexOffset = 0) noexcept;
      PersonInfo() = default;

      /* column accessors (generated) */
      const int32_t &getValueOfId() const noexcept;
      const std::shared_ptr<int32_t> &getId() const noexcept;

      const int32_t &getValueOfJobId() const noexcept;
      const std::shared_ptr<int32_t> &getJobId() const noexcept;

      const std::string &getValueOfJobTitle() const noexcept;
      const std::shared_ptr<std::string> &getJobTitle() const noexcept;

      const int32_t &getValueOfDepartmentId() const noexcept;
      const std::shared_ptr<int32_t> &getDepartmentId() const noexcept;

      const std::string &getValueOfDepartmentName() const noexcept;
      const std::shared_ptr<std::string> &getDepartmentName() const noexcept;

      const int32_t &getValueOfManagerId() const noexcept;
      const std::shared_ptr<int32_t> &getManagerId() const noexcept;

      const std::string &getValueOfManagerFullName() const noexcept;
      const std::shared_ptr<std::string> &getManagerFullName() const noexcept;

      const std::string &getValueOfFirstName() const noexcept;
      const std::shared_ptr<std::string> &getFirstName() const noexcept;

      const std::string &getValueOfLastName() const noexcept;
      const std::shared_ptr<std::string> &getLastName() const noexcept;

      const ::trantor::Date &getValueOfHireDate() const noexcept;
      const std::shared_ptr<::trantor::Date> &getHireDate() const noexcept;

      Json::Value toJson() const;

    private:
      friend drogon::orm::Mapper<PersonInfo>;
      std::shared_ptr<int32_t> id_;
      std::shared_ptr<int32_t> jobId_;
      std::shared_ptr<std::string> jobTitle_;
      std::shared_ptr<int32_t> departmentId_;
      std::shared_ptr<std::string> departmentName_;
      std::shared_ptr<int32_t> managerId_;
      std::shared_ptr<std::string> managerFullName_;
      std::shared_ptr<std::string> firstName_;
      std::shared_ptr<std::string> lastName_;
      std::shared_ptr<::trantor::Date> hireDate_;
    };
  } // namespace org_chart
} // namespace drogon_model
