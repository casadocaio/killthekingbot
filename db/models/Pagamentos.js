import mongoose from 'mongoose';
const SchemaTypes = mongoose.Schema.Types;

const pagamentoSchema = new mongoose.Schema({
  messageid: {
    type: Number,
    required: true
  },
  txid: {
    type: String,
    required: true
  },
  messagedate: {
    type: Number,
    required: true
  }
})
export default mongoose.model('Pagamentos', pagamentoSchema);