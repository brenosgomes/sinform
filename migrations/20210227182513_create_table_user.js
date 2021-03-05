exports.up = function (knex) {
    return knex.schema.createTable("user", (table) => {
      table.increments("user_id").primary();
      table.string("user_name").notNull();
      table.string("user_email").notNull();
      table.string("user_password").notNull();
      table.string("user_city").nullable();
      table.string("user_state").nullable();
      table.string("user_university").nullable();
      table.string("user_stateUniversity").nullable();
      table.string("user_token").nullable();
      table.datetime("user_expiresToken").nullable();
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("user");
  };
  