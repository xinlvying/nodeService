// var recommender = {};

// var jd = require('jsdataframe');
// var fs = require('fs');
// var linearAlgebra = require('linear-algebra')(),     // initialise it
//   Vector = linearAlgebra.Vector,
//   Matrix = linearAlgebra.Matrix;

// recommender.recommend = function (userId, n, clusterPath) {
//   return new Promise(function (resolve, reject) {
//     fs.readFile(clusterPath, "utf8", function (error, data) {
//       if (!error) {
//         var clusters = JSON.parse(data);
//         var userCluster = findUserCluster(userId, clusters);
//         var items = getItemsRating(userCluster, clusters.items);
//         var sortedItems = items.sort(compare);
//         var recommendation = (sortedItems.length > n) ? sortedItems.slice(0, n - 1) : sortedItems;
//         resolve(recommendation);
//       } else {
//         reject(error)
//       }
//     });
//   });
// };

function calculateSimilarities(documentVectors, options) {
  const data = {};

  for (let i = 0; i < documentVectors.length; i += 1) {
    const documentVector = documentVectors[i];
    const { id } = documentVector;

    data[id] = [];
  }
  for (let i = 0; i < documentVectors.length; i += 1) {
    for (let j = 0; j < i; j += 1) {
      const id_i = documentVectors[i].id;
      const v_i = documentVectors[i].vector;
      const id_j = documentVectors[j].id;
      const v_j = documentVectors[j].vector;
      const similarity = v_i.getCosineSimilarity(v_j);

      if (similarity > options.minScore) {
        data[id_i].push({ id: id_j, score: similarity });
        data[id_j].push({ id: id_i, score: similarity });
      }
    }
  }
}



// ReadingRecord.find({ login_phone })
//   .then(ReadingRecord => {
//     // console.log(ReadingRecord);
//     for (let i = 0; i < ReadingRecord.length; i++) {
//       switch (ReadingRecord.category) {
//         case 
//       }
//     }
//   })
//   .catch(err => handleError({ res, err, message: err }))




// var compare = function (a, b) {
//   if (a.score > b.score)
//     return -1;
//   if (a.score < b.score)
//     return 1;
//   return 0;
// }

// var findUserCluster = function (userId, clusters) {
//   var userIdx = clusters.users[0].values.indexOf(userId + '');
//   for (var cluster of clusters.clusters) {
//     var indexInCluster = cluster.clusterInd.indexOf(userIdx);
//     if (indexInCluster >= 0) {
//       return cluster.cluster;
//     }
//   }
// }

// var getItemsRating = function (usersInCluster, items) {
//   var dataframe = jd.dfFromObjArray(usersInCluster);
//   var currentUserRatings = dataframe.s(0, null).toMatrix();
//   var neighborsRatings = dataframe.s(jd.rng(1, dataframe.nRow()), null).toMatrix();
//   var clusterRatingMatrix = new Matrix(neighborsRatings);
//   var normalizedMatrix = normalizeMatrix(clusterRatingMatrix, 4);
//   var scores = sumColumns(normalizedMatrix);
//   return getRecommendedItems(items, scores.toArray()[0], currentUserRatings[0]);

// }

// var normalizeMatrix = function (matrix, r) {
//   var normalizedMatrix = matrix.map(function (v) {
//     return (v >= r) ? 1 : 0;
//   });
//   return normalizedMatrix;
// }

// var sumColumns = function (matrix) {
//   var sumVector = Vector.zero(matrix.rows).plusEach(1);
//   return sumVector.dot(matrix);
// }

// var getRecommendedItems = function (items, scores, currentUserRatings) {
//   var recommendedItems = [];
//   for (var i = 0; i < items.length; i++) {
//     var item = currentUserRatings[i];
//     if (item <= 0 || item == null) {
//       recommendedItems.push({
//         itemId: items[i],
//         score: scores[i]
//       });
//     }
//   }
//   return recommendedItems;
// }




// Object.keys(data).forEach((id) => {
//   data[id].sort((a, b) => b.score - a.score);

//   if (data[id].length > options.maxSimilarDocuments) {
//     data[id] = data[id].slice(0, options.maxSimilarDocuments);
//   }
// });

// return data;
// }

// module.exports = recommender;

// // recommender-node


// const _ = require('underscore');
// const Vector = require('vector-object');
// const striptags = require('striptags');
// const sw = require('stopword');
// const natural = require('natural');

// const { TfIdf, PorterStemmer, NGrams } = natural;
// const tokenizer = new natural.WordTokenizer();

// const defaultOptions = {
//   maxVectorSize: 100,
//   maxSimilarDocuments: Number.MAX_SAFE_INTEGER,
//   minScore: 0,
//   debug: false,
// };

// class ContentBasedRecommender {
//   constructor(options = {}) {
//     this.setOptions(options);

//     this.data = {};
//   }

//   setOptions(options = {}) {
//     // validation
//     if ((options.maxVectorSize !== undefined) &&
//       (!Number.isInteger(options.maxVectorSize) || options.maxVectorSize <= 0)) {
//       throw new Error('The option maxVectorSize should be integer and greater than 0');
//     }

//     if ((options.maxSimilarDocuments !== undefined) &&
//       (!Number.isInteger(options.maxSimilarDocuments) || options.maxSimilarDocuments <= 0)) {
//       throw new Error('The option maxSimilarDocuments should be integer and greater than 0');
//     }

//     if ((options.minScore !== undefined) &&
//       (!_.isNumber(options.minScore) || options.minScore < 0 || options.minScore > 1)) {
//       throw new Error('The option minScore should be a number between 0 and 1');
//     }

//     this.options = Object.assign({}, defaultOptions, options);
//   }

//   train(documents) {
//     this.validateDocuments(documents);

//     if (this.options.debug) {
//       console.log(`Total documents: ${documents.length}`);
//     }

//     // step 1 - preprocess the documents
//     const preprocessDocs = this._preprocessDocuments(documents, this.options);

//     // step 2 - create document vectors
//     const docVectors = this._produceWordVectors(preprocessDocs, this.options);

//     // step 3 - calculate similarities
//     this.data = this._calculateSimilarities(docVectors, this.options);
//   }

//   validateDocuments(documents) {
//     if (!_.isArray(documents)) {
//       throw new Error('Documents should be an array of objects');
//     }

//     for (let i = 0; i < documents.length; i += 1) {
//       const document = documents[i];

//       if (!_.has(document, 'id') || !_.has(document, 'content')) {
//         throw new Error('Documents should be have fields id and content');
//       }
//     }
//   }

//   getSimilarDocuments(id, start = 0, size = undefined) {
//     let similarDocuments = this.data[id];

//     if (similarDocuments === undefined) {
//       return [];
//     }

//     const end = (size !== undefined) ? start + size : undefined;
//     similarDocuments = similarDocuments.slice(start, end);

//     return similarDocuments;
//   }

//   export() {
//     return {
//       options: this.options,
//       data: this.data,
//     };
//   }

//   import(object) {
//     const { options, data } = object;

//     this.setOptions(options);
//     this.data = data;
//   }

//   // pseudo private methods

//   _preprocessDocuments(documents, options) {
//     if (options.debug) {
//       console.log('Preprocessing documents');
//     }

//     const processedDocuments = documents.map(item => ({
//       id: item.id,
//       tokens: this._getTokensFromString(item.content),
//     }));

//     return processedDocuments;
//   }

//   _getTokensFromString(string) {
//     // remove html and to lower case
//     const tmpString = striptags(string, [], ' ').toLowerCase();

//     // tokenize the string
//     const tokens = tokenizer.tokenize(tmpString);

//     // get unigrams
//     const unigrams = sw.removeStopwords(tokens)
//       .map(unigram => PorterStemmer.stem(unigram));

//     // get bigrams
//     const bigrams = NGrams.bigrams(tokens)
//       .filter(bigram =>
//         // filter terms with stopword
//         (bigram.length === sw.removeStopwords(bigram).length))
//       .map(bigram =>
//         // stem the tokens
//         bigram.map(token => PorterStemmer.stem(token)).join('_'));

//     // get trigrams
//     const trigrams = NGrams.trigrams(tokens)
//       .filter(trigram =>
//         // filter terms with stopword
//         (trigram.length === sw.removeStopwords(trigram).length))
//       .map(trigram =>
//         // stem the tokens
//         trigram.map(token => PorterStemmer.stem(token)).join('_'));

//     return [].concat(unigrams, bigrams, trigrams);
//   }

//   _produceWordVectors(processedDocuments, options) {
//     // process tfidf
//     const tfidf = new TfIdf();

//     processedDocuments.forEach((processedDocument) => {
//       tfidf.addDocument(processedDocument.tokens);
//     });

//     // create word vector
//     const documentVectors = [];

//     for (let i = 0; i < processedDocuments.length; i += 1) {
//       if (options.debug) {
//         console.log(`Creating word vector for document ${i}`);
//       }

//       const processedDocument = processedDocuments[i];
//       const hash = {};

//       const items = tfidf.listTerms(i);
//       const maxSize = Math.min(options.maxVectorSize, items.length);
//       for (let j = 0; j < maxSize; j += 1) {
//         const item = items[j];
//         hash[item.term] = item.tfidf;
//       }

//       const documentVector = {
//         id: processedDocument.id,
//         vector: new Vector(hash),
//       };

//       documentVectors.push(documentVector);
//     }

//     return documentVectors;
//   }

//   _calculateSimilarities(documentVectors, options) {
//     const data = {};

//     // initialize data hash
//     for (let i = 0; i < documentVectors.length; i += 1) {
//       const documentVector = documentVectors[i];
//       const { id } = documentVector;

//       data[id] = [];
//     }

//     // calculate the similar scores
//     for (let i = 0; i < documentVectors.length; i += 1) {
//       if (options.debug) {
//         console.log(`Calculating similarity score for document ${i}`);
//       }

//       for (let j = 0; j < i; j += 1) {
//         const idi = documentVectors[i].id;
//         const vi = documentVectors[i].vector;
//         const idj = documentVectors[j].id;
//         const vj = documentVectors[j].vector;
//         const similarity = vi.getCosineSimilarity(vj);

//         if (similarity > options.minScore) {
//           data[idi].push({ id: idj, score: similarity });
//           data[idj].push({ id: idi, score: similarity });
//         }
//       }
//     }

//     // finally sort the similar documents by descending order
//     Object.keys(data).forEach((id) => {
//       data[id].sort((a, b) => b.score - a.score);

//       if (data[id].length > options.maxSimilarDocuments) {
//         data[id] = data[id].slice(0, options.maxSimilarDocuments);
//       }
//     });

//     return data;
//   }
// }

// module.exports = ContentBasedRecommender;


const _ = require('underscore');
const Vector = require('vector-object');
const striptags = require('striptags');
const sw = require('stopword');
const natural = require('natural');

const { TfIdf, PorterStemmer, NGrams } = natural;
const tokenizer = new natural.WordTokenizer();

const defaultOptions = {
  maxVectorSize: 100,
  maxSimilarDocuments: Number.MAX_SAFE_INTEGER,
  minScore: 0,
  debug: false,
};

class ContentBasedRecommender {
  constructor(options = {}) {
    this.setOptions(options);

    this.data = {};
  }

  setOptions(options = {}) {
    // validation
    if ((options.maxVectorSize !== undefined) &&
        (!Number.isInteger(options.maxVectorSize) || options.maxVectorSize <= 0)) {
      throw new Error('The option maxVectorSize should be integer and greater than 0');
    }

    if ((options.maxSimilarDocuments !== undefined) &&
        (!Number.isInteger(options.maxSimilarDocuments) || options.maxSimilarDocuments <= 0)) {
      throw new Error('The option maxSimilarDocuments should be integer and greater than 0');
    }

    if ((options.minScore !== undefined) &&
        (!_.isNumber(options.minScore) || options.minScore < 0 || options.minScore > 1)) {
      throw new Error('The option minScore should be a number between 0 and 1');
    }

    this.options = Object.assign({}, defaultOptions, options);
  }

  train(documents) {
    this.validateDocuments(documents);

    if (this.options.debug) {
      console.log(`Total documents: ${documents.length}`);
    }

    // step 1 - preprocess the documents
    const preprocessDocs = this._preprocessDocuments(documents, this.options);

    // step 2 - create document vectors
    const docVectors = this._produceWordVectors(preprocessDocs, this.options);

    // step 3 - calculate similarities
    this.data = this._calculateSimilarities(docVectors, this.options);
  }

  validateDocuments(documents) {
    if (!_.isArray(documents)) {
      throw new Error('Documents should be an array of objects');
    }

    for (let i = 0; i < documents.length; i += 1) {
      const document = documents[i];

      if (!_.has(document, 'id') || !_.has(document, 'content')) {
        throw new Error('Documents should be have fields id and content');
      }
    }
  }

  getSimilarDocuments(id, start = 0, size = undefined) {
    let similarDocuments = this.data[id];

    if (similarDocuments === undefined) {
      return [];
    }

    const end = (size !== undefined) ? start + size : undefined;
    similarDocuments = similarDocuments.slice(start, end);

    return similarDocuments;
  }

  export() {
    return {
      options: this.options,
      data: this.data,
    };
  }

  import(object) {
    const { options, data } = object;

    this.setOptions(options);
    this.data = data;
  }

  // pseudo private methods

  _preprocessDocuments(documents, options) {
    if (options.debug) {
      console.log('Preprocessing documents');
    }

    const processedDocuments = documents.map(item => ({
      id: item.id,
      tokens: this._getTokensFromString(item.content),
    }));

    return processedDocuments;
  }

  _getTokensFromString(string) {
    // remove html and to lower case
    const tmpString = striptags(string, [], ' ').toLowerCase();

    // tokenize the string
    const tokens = tokenizer.tokenize(tmpString);

    // get unigrams
    const unigrams = sw.removeStopwords(tokens)
      .map(unigram => PorterStemmer.stem(unigram));

    // get bigrams
    const bigrams = NGrams.bigrams(tokens)
      .filter(bigram =>
        // filter terms with stopword
        (bigram.length === sw.removeStopwords(bigram).length))
      .map(bigram =>
        // stem the tokens
        bigram.map(token => PorterStemmer.stem(token)).join('_'));

    // get trigrams
    const trigrams = NGrams.trigrams(tokens)
      .filter(trigram =>
        // filter terms with stopword
        (trigram.length === sw.removeStopwords(trigram).length))
      .map(trigram =>
        // stem the tokens
        trigram.map(token => PorterStemmer.stem(token)).join('_'));

    return [].concat(unigrams, bigrams, trigrams);
  }

  _produceWordVectors(processedDocuments, options) {
    // process tfidf
    const tfidf = new TfIdf();

    processedDocuments.forEach((processedDocument) => {
      tfidf.addDocument(processedDocument.tokens);
    });

    // create word vector
    const documentVectors = [];

    for (let i = 0; i < processedDocuments.length; i += 1) {
      if (options.debug) {
        console.log(`Creating word vector for document ${i}`);
      }

      const processedDocument = processedDocuments[i];
      const hash = {};

      const items = tfidf.listTerms(i);
      const maxSize = Math.min(options.maxVectorSize, items.length);
      for (let j = 0; j < maxSize; j += 1) {
        const item = items[j];
        hash[item.term] = item.tfidf;
      }

      const documentVector = {
        id: processedDocument.id,
        vector: new Vector(hash),
      };

      documentVectors.push(documentVector);
    }

    return documentVectors;
  }

  _calculateSimilarities(documentVectors, options) {
    const data = {};

    // initialize data hash
    for (let i = 0; i < documentVectors.length; i += 1) {
      const documentVector = documentVectors[i];
      const { id } = documentVector;

      data[id] = [];
    }

    // calculate the similar scores
    for (let i = 0; i < documentVectors.length; i += 1) {
      if (options.debug) {
        console.log(`Calculating similarity score for document ${i}`);
      }

      for (let j = 0; j < i; j += 1) {
        const idi = documentVectors[i].id;
        const vi = documentVectors[i].vector;
        const idj = documentVectors[j].id;
        const vj = documentVectors[j].vector;
        const similarity = vi.getCosineSimilarity(vj);

        if (similarity > options.minScore) {
          data[idi].push({ id: idj, score: similarity });
          data[idj].push({ id: idi, score: similarity });
        }
      }
    }

    // finally sort the similar documents by descending order
    Object.keys(data).forEach((id) => {
      data[id].sort((a, b) => b.score - a.score);

      if (data[id].length > options.maxSimilarDocuments) {
        data[id] = data[id].slice(0, options.maxSimilarDocuments);
      }
    });

    return data;
  }
}

module.exports = ContentBasedRecommender;