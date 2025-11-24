import { MongoClient, ServerApiVersion, ObjectId } from "mongodb";

export class MongoDatabase {
    constructor() {
        // Initialising Username/Password/Server to access Cloud MongoDB
        const password = "";
        const username = "Ameera";
        const server = "";

        // URI Encoding
        const encodedUsername = encodeURIComponent(username);
        const encodedPassword = encodeURIComponent(password);

        // Connection URI Link
        const connectionURI = `mongodb+srv://${encodedUsername}:${encodedPassword}@${server}`;

        // Creating a MongoClient
        // serverApi is used to specify the version of the MongoDB server to connect to
        // strict is set to false to allow for use of deprecated features
        // deprecationErrors is set to true to allow for the display of deprecation warnings
        this.client = new MongoClient(connectionURI, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: false,
                deprecationErrors: true,
            }
        });

        // Initialising the database and collections
        this.connect();
    }

    async connect() {
        try {
            // Connecting to the MongoDB server
            await this.client.connect();
            console.log("Connected to MongoDB server");

            // Accessing the ________ database
            this.database = this.client.db(" ________");

            // Accessing the Lessons and Orders collections
            this.lessonsCollection = this.database.collection("Lessons");
            this.ordersCollection = this.database.collection("Orders");
        } catch (error) {
            console.error("Error connecting to MongoDB server:", error);
        }
    }

    // Methods to get all lessons from the database
    async getAllLessons() {
        try {
            // Retrieving all lessons in the Lessons collection and converting them to an array
            const lessons = await this.lessonsCollection.find({}).toArray();
            return lessons;
        } catch (error) {
            console.error("Error retrieving lessons:", error);
        }
    }

    /*
    Method to add an order to the Orders collection
    @params order: The order to be added to the Orders collection
    */
    async addOrder(order) {
        try {
            // Inserting the order into the Orders collection
            const result = await this.ordersCollection.insertOne(order);
            return result;
        } catch (error) {
            console.error("Error adding order:", error);
        }
    }

    /*
    Method to update any attributes of a specific lesson
    @params lessonID: The ID of the lesson to be updated
    @params newLesson: The new lesson object to replace the existing lesson
    */
    async updateLesson(lessonID, newLesson) {
        try {
            await this.lessonsCollection.replaceOne(
                { _id: new ObjectId(lessonID) },
                newLesson
            );
        } catch (error) {
            console.error("Error updating lesson:", error);
        }
    }

    /*
    Method to search for lessons based on a search query
    @params searchQuery: The search query to search for lessons
    */
    async searchTuitions(searchQuery) {
        try {
            // Searching for lessons based on search query
            const results = await this.lessonsCollection.find({
                // Using the $or operator to search for lessons if it matches any of the search criteria
                $or: [
                    // Case-insensitive search for subject and location
                    { subject: { $regex: searchQuery, $options: 'i' } },
                    { location: { $regex: searchQuery, $options: 'i' } },
                    {
                        // expr allows for aggregated expressions to be used in the query
                        // regexMatch allows for regex expressions to be used in the query
                        // toString converts the price and space fields to strings when fetching them
                        $expr: {
                            $regexMatch: {
                                input: { $toString: "$price" },
                                regex: searchQuery,
                            }
                        }
                    },
                    {
                        $expr: {
                            $regexMatch: {
                                input: { $toString: "$space" },
                                regex: searchQuery,
                            }
                        }
                    }
                ]
            }).toArray();

            return results;
        } catch (error) {
            console.error("Error searching for lessons:", error);
        }
    }
}
