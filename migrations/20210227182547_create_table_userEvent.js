exports.up = function (knex) {
    return knex.schema.createTable("userEvent", (table) => {
      table.increments("userEvent_id").primary();
      table.integer("user_id").unsigned().notNull();
      table.foreign("user_id").references("user_id").inTable("user").onDelete("CASCADE");
      table.integer("event_id").unsigned().notNull();
      table.foreign("event_id").references("event_id").inTable("event").onDelete("CASCADE");
      table.boolean("userEvent_presence").nullable();
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("userEvent");
  };
  