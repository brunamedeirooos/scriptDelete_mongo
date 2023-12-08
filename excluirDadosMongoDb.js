const { MongoClient } = require("mongodb");
// Replace the uri string with your connection string.
const uri = "mongodb+srv:..."; //uri do database
const client = new MongoClient(uri);
async function run() {
  try {
    const database = client.db('bancoDeProducao-wp-stag'); //nome do database
    const messagesCollection = database.collection('messages'); //collections do database que está se referindo

    const query = [
        {
          $match:
            /**
             * query: The query in MQL.
             */
            {
              $or: [
                {
                  dialogflow: {
                    $exists: false,
                  },
                },
                {
                  response: {
                    $exists: false,
                  },
                },
              ],
            },
        },
        {
          $project:
            /**
             * specifications: The fields to
             *   include or exclude.
             */
            {
              id: 1,
              _id: 0,
            },
        },
        {
          $group:
            /**
             * _id: The id of the group.
             * fieldN: The first field name.
             */
            {
              _id: null,
              ids: {
                $addToSet: "$id",
              },
            },
        },
      ]; 

    const matchedResult = await messagesCollection.aggregate(query).toArray();
    const ids = matchedResult[0].ids;

    const deleteQuery = {
        id: {
            $in: ids
        }
    };

    await messagesCollection.deleteMany(deleteQuery);
  } finally {
    // Ensures that the client will close when you finish/error
    await client.close();
  }
}

run().catch(console.dir);
