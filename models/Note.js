import mongoose from 'mongoose';
const Schema = mongoose.Schema;

const noteSchema = new Schema({
  body: String,
  deadline: String,
  status: String,
});
export const Note = mongoose.model('Note', noteSchema);
