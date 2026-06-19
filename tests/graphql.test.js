import request from "supertest";
import app from "../index.js";
describe("GraphQL API", () => {

  let testEmail;

  beforeAll(async () => {
    testEmail = `test_${Date.now()}@test.com`;

    // registracija korisnika prije testova
    await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            register(
              username: "testUser"
              email: "${testEmail}"
              password: "123"
            )
          }
        `
      });
  });

  test("should return users", async () => {
    const response = await request(app)
      .post("/graphql")
      .send({
        query: `
          {
            getUsers {
              id
              username
              email
            }
          }
        `
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.getUsers).toBeDefined();
    expect(Array.isArray(response.body.data.getUsers)).toBe(true);
  });

  test("should register new user", async () => {
    const email = `new_${Date.now()}@test.com`;

    const response = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            register(
              username: "newUser"
              email: "${email}"
              password: "123"
            )
          }
        `
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.register).toBe("User created!");
  });

  test("should fail login with non-existing user", async () => {
  const response = await request(app)
    .post("/graphql")
    .send({
      query: `
        mutation {
          login(
            email: "nonexisting@test.com"
            password: "123"
          ) {
            id
            username
          }
        }
      `
    });

  expect(response.statusCode).toBe(200);
  expect(response.body.errors).toBeDefined();
});

test("should fail login with non-existing user", async () => {
  const response = await request(app)
    .post("/graphql")
    .send({
      query: `
        mutation {
          login(
            email: "nonexisting@test.com"
            password: "123"
          ) {
            id
            username
          }
        }
      `
    });

  expect(response.statusCode).toBe(200);
  expect(response.body.errors).toBeDefined();
});
  test("should login user", async () => {
    const response = await request(app)
      .post("/graphql")
      .send({
        query: `
          mutation {
            login(
              email: "${testEmail}"
              password: "123"
            ) {
              id
              username
            }
          }
        `
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.data.login).toBeDefined();
    expect(response.body.data.login).toHaveProperty("id");
    expect(response.body.data.login).toHaveProperty("username");
  });

});


//   node --experimental-vm-modules node_modules/jest/bin/jest.js