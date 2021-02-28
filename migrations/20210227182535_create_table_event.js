exports.up = function (knex) {
    return knex.schema.createTable("event", (table) => {
      table.increments("event_id").primary();
      table.string("event_name").notNull();
      table.string("event_guest").notNull();
      table.integer("event_workload").notNull();
      table.string("event_url").nullable();
      table.boolean("event_type").notNull();
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("event");
  };
  