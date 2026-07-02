// Compass Playground / mongosh
const col = db.getCollection('orders');
let i = 1;
const docs = col.find({}, { sort: { _id: 1 } }).toArray();
docs.forEach(doc => {
	col.updateOne({ _id: doc._id }, { $set: { queue: i++ } });
});
