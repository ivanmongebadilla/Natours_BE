class APIFeatures {
    constructor(query, queryString) {
        this.query = query;
        this.queryString = queryString;
    }

    filter() {
        // 1) Filtering
        const queryObj = {...this.queryString} //creates new object (hard copy)
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el])

        // 2) Advanced filtering
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr))

        return this //To return the entire object
    }

    sort() {
        // 3) Sorting
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ');
            this.query = this.query.sort(sortBy);
        } else {
            this.query = this.query.sort('-createdAt');
        }

        return this;
    }

    limitField() {
        // 4) Field Limiting
        if (this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            console.log(fields);
            this.query = this.query.select(fields)
        } else {
            this.query = this.query.select('-__v')
        }

        return this;
    }

    paginate() {
        // 5) Pagination
        const page = this.queryString.page * 1 || 1; //String to a number || by default 1
        const limit = this.queryString.limit * 1 || 100;
        const skip = (page - 1) * limit;
        
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
}

module.exports = APIFeatures;