import mongoose from 'mongoose';

const trackerSchema = new mongoose.Schema({
  _id: {
    type: String,
    required: true
  },
  createdat: {
    type: Date,
    required: true
  },
  updatedat: {
    type: Date,
    required: false
  },
  wallet: {
    type: String,
    required: true
  },
  paymenttxid: {
    type: String,
    required: false
  },
  minttxid: {
    type: String,
    required: false
  },
  processed: {
    type: Boolean,
    required: true
  }
})
export default mongoose.model('Trackers', trackerSchema);
//module.exports = mongoose.model('Trackers', trackerSchema);