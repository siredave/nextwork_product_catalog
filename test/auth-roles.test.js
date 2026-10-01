const test = require("node:test");
const assert = require("node:assert/strict");
const User = require("../src/models/user.model");
const { authorizeRoles } = require("../src/middleware/auth");

function runAuthorization(role, allowedRoles, includeUser = true) {
  const response = {
    statusCode: undefined,
    payload: undefined,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.payload = payload;
      return this;
    },
  };
  let nextCalled = false;
  const request = includeUser ? { user: { role } } : {};

  authorizeRoles(...allowedRoles)(request, response, () => {
    nextCalled = true;
  });

  return { response, nextCalled };
}

test("new accounts default to the least-privileged customer role", () => {
  assert.equal(User.schema.path("role").defaultValue, "customer");
  assert.deepEqual(User.schema.path("role").enumValues, [
    "customer",
    "staff",
    "admin",
  ]);
});

test("authorization allows an explicitly permitted role", () => {
  const { response, nextCalled } = runAuthorization("admin", ["admin"]);

  assert.equal(nextCalled, true);
  assert.equal(response.statusCode, undefined);
});

test("authorization rejects authenticated users without the required role", () => {
  const { response, nextCalled } = runAuthorization("customer", ["admin"]);

  assert.equal(nextCalled, false);
  assert.equal(response.statusCode, 403);
  assert.equal(response.payload.success, false);
});

test("authorization returns 401 if authentication middleware was not applied", () => {
  const { response, nextCalled } = runAuthorization(
    undefined,
    ["admin"],
    false,
  );

  assert.equal(nextCalled, false);
  assert.equal(response.statusCode, 401);
});

test("authorization supports routes that allow multiple roles", () => {
  const { response, nextCalled } = runAuthorization("staff", [
    "staff",
    "admin",
  ]);

  assert.equal(nextCalled, true);
  assert.equal(response.statusCode, undefined);
});
