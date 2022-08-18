import mongoose from 'mongoose';

const walletSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  wallet: {
    type: String,
    required: true
  }
})
export default mongoose.model('Wallets', walletSchema);