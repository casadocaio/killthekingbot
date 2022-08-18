import mongoose from "mongoose";

function connecteToDatabase (){
  mongoose.connect(
    process.env.DATABASE_URL,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  )

  const db = mongoose.connection;

  db.on("error", (error) => {
    console.log('DB error: ', error);
  });

  db.once("open", () => {
    console.log('Connected to the database');
  });

}

export default connecteToDatabase;