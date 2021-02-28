exports.up = function (knex) {
    return knex.schema.createTable("user", (table) => {
      table.increments("user_id").primary();
      table.string("user_name").notNull();
      table.string("user_email").notNull();
      table.string("user_password").notNull();
      table.string("user_city").nullable();
      table.string("user_state").nullable();
      table.string("user_university").nullable();
      table.string("user_size").notNull();
      table.string("user_url").notNull();
      table.string("user_key").notNull();
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("user");
  };
  