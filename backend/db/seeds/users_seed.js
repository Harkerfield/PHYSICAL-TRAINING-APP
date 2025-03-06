const bcrypt = require('bcrypt');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Deletes ALL existing entries
  await knex('users').del();

  // Inserts seed entries
  const hashedPin = await bcrypt.hash('admin_pin', 10);
  await knex('users').insert([
    { id: 1, teamname: 'admin', pin: hashedPin, is_admin: true },
  ]);
};
