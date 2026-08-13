import { MySQL } from 'dt-sql-parser';

const parser = new MySQL();
const errors = parser.validate("SELECT * FORM table;");
console.log(errors);
