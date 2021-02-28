exports.up = function (knex) {
    return knex.schema.createTable("certificate", (table) => {
      table.string("certificate_id").primary();
      table.integer("user_id").unsigned().notNull();
      table.foreign("user_id").references("user_id").inTable("user").onDelete("CASCADE");
      table.integer("certificate_participationTime").notNull();
    });
  };
  
  exports.down = function (knex) {
    return knex.schema.dropTable("certificate");
  };
  