const { MongoClient } = require('mongodb');

async function main() {
    /**
     * Connection URI. Update <username>, <password>, and <your-cluster-url> to reflect your cluster.
     * See https://docs.mongodb.com/drivers/node/ for more details
     */
    const uri = "mongodb+srv://<username>:<password>@<your-cluster-url>/sample_airbnb?retryWrites=true&w=majority";

    /**
     * The Mongo Client you will use to interact with your database
     * See https://mongodb.github.io/node-mongodb-native/3.6/api/MongoClient.html for more details
     * In case: '[MONGODB DRIVER] Warning: Current Server Discovery and Monitoring engine is deprecated...'
     * pass option { useUnifiedTopology: true } to the MongoClient constructor.
     * const client =  new MongoClient(uri, {useUnifiedTopology: true})
     */
    const client = new MongoClient(uri);

    try {
        // Connect to the MongoDB cluster
        await client.connect();

        // Make the appropriate DB calls

        // DELETE ONE
        // Check if a listing named "Cozy Cottage" exists. Run update.js if you do not have this listing.
        await printIfListingExists(client, "Cozy Cottage");
        // Delete the "Cozy Cottage" listing
        await deleteListingByName(client, "Cozy Cottage");
        // Check that the listing named "Cozy Cottage" no longer exists
        await printIfListingExists(client, "Cozy Cottage");

        // DELETE MANY
        // Check if the listing named "Ribeira Charming Duplex" (last scraped February 16, 2019) exists
        await printIfListingExists(client, "Ribeira Charming Duplex");
        // Check if the listing named "Horto flat with small garden" (last scraped February 11, 2019) exists
        await printIfListingExists(client, "Horto flat with small garden");
        // Delete the listings that were scraped before February 15, 2019
        await deleteListingsScrapedBeforeDate(client, new Date("2019-02-15"));
        // Check that the listing named "Ribeira Charming Duplex" still exists
        await printIfListingExists(client, "Ribeira Charming Duplex");
        // Check that the listing named "Horto flat with small garden" no longer exists
        await printIfListingExists(client, "Horto flat with small garden");

    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
    }
}

main().catch(console.error);

/**
 * Delete an Airbnb listing with the given name.
 * Note: If more than one listing has the same name, only the first listing the database finds will be deleted.
 * @param {MongoClient} client A MongoClient that is connected to a cluster with the sample_airbnb database
 * @param {string} nameOfListing The name of the listing you want to delete
 */
async function deleteListingByName(client, nameOfListing) {
    // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#deleteOne for the deleteOne() docs
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteOne({ name: nameOfListing });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

/**
 * Delete all listings that were last scraped prior to the given date
 * @param {MongoClient} client A MongoClient that is connected to a cluster with the sample_airbnb database
 * @param {Date} date The date to check the last_scraped property against
 */
async function deleteListingsScrapedBeforeDate(client, date) {
    // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#deleteMany for the deleteMany() docs
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").deleteMany({ "last_scraped": { $lt: date } });
    console.log(`${result.deletedCount} document(s) was/were deleted.`);
}

/**
 * Print information indicating if a listing with the given name exists. 
 * If a listing has the 'last_scraped' field, print that as well.
 * Note: If more than one listing has the same name, only the first listing the database finds will be printed..
 * @param {MongoClient} client A MongoClient that is connected to a cluster with the sample_airbnb database
 * @param {String} nameOfListing The name of the listing you want to find
 */
async function printIfListingExists(client, nameOfListing) {
    // See https://mongodb.github.io/node-mongodb-native/3.6/api/Collection.html#findOne for the findOne() docs
    const result = await client.db("sample_airbnb").collection("listingsAndReviews").findOne({ name: nameOfListing });

    if (result) {
        if (result.last_scraped) {
            console.log(`Found a listing in the collection with the name '${nameOfListing}'. Listing was last scraped ${result.last_scraped}.`);
        } else {
            console.log(`Found a listing in the collection with the name '${nameOfListing}'`);
        }
    } else {
        console.log(`No listings found with the name '${nameOfListing}'`);
    }
}
