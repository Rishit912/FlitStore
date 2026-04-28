import mongoose from 'mongoose';

const globalForMongoose = globalThis;

if (!globalForMongoose.__flitStoreMongoose) {
    globalForMongoose.__flitStoreMongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    try {
        const MONGO_URI = process.env.MONGO_URI;

        if (!MONGO_URI) {
            throw new Error('MONGO_URI is not configured');
        }

        if (globalForMongoose.__flitStoreMongoose.conn) {
            return globalForMongoose.__flitStoreMongoose.conn;
        }

        if (!globalForMongoose.__flitStoreMongoose.promise) {
            globalForMongoose.__flitStoreMongoose.promise = mongoose.connect(MONGO_URI, {
                bufferCommands: false,
            });
        }

        const conn = await globalForMongoose.__flitStoreMongoose.promise;
        globalForMongoose.__flitStoreMongoose.conn = conn;
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        throw error;
    }
};

export default connectDB;