import Activity from '../models/activity_model';

function processResults(results, tags) {
  const hits = results.hits.total;
  if (hits === 0) return [];
  const data = results.hits.hits;
  return data.map((value) => {
    const photoURL = `/api/activity/${value._id}/photo`;
    return {
      activityId: value._id,
      activityURL: `/api/activity/${value._id}`,
      name: value.name,
      description: value.description,
      lat_lon: value.geo_location,
      min_age: value.min_age,
      max_age: value.max_age,
      price: value.price,
      tags: value.tags,
      available_tickets: value.available_tickets,
      is_active: value.is_active,
      locked: value.locked,
      date: value.date,
      photo: photoURL
    };
  }).filter((value) => {
    const valid = value.is_active && (!value.locked) && (value.available_tickets > 0);
    if (!tags) return valid;
    const searchTags = new Set(tags);
    const common = (value.tags.filter(x => searchTags.has(x))).length > 0;
    return valid && common;
  });
}

// Currently default region is assumed to be 10km from
// Athens
export function search(req, res, next) {
  var queryText = req.body.text || '*';
  const min_age = req.body.min_age || 0;
  const max_age = req.body.max_age || 20;
  const min_price = req.body.min_price || 0;
  const max_price = req.body.max_price || 1000;
  const distance = req.body.distance || 10;
  const lat_lon = req.body.lat_lon || '37.983,23.733';
  let tags = null;
  if (req.body.tags) {
    tags = req.body.tags.split(',').map(x => x.trim());
  }

  const elasticQuery = {
    bool: {
      must: {
        multi_match: {
          query: queryText,
          analyzer: 'greek',
          fuzziness: 1,
          prefix_length: 1
        }
      },
      filter: {
        bool: {
          must: [
            {
              range: {
                price: {
                  lte: max_price,
                  gte: min_price
                },
              }
            },
            {
              range: {
                max_age: {
                  lte: max_age,
                },
              }
            },
            {
              range: {
                min_age: {
                  gte: min_age,
                },
              }
            },
            {
              geo_distance: {
                distance: `${distance}km`,
                geo_location: lat_lon
              }
            }
          ]
        }
      }
    }
  };

  Activity.search(
    elasticQuery,
    { hydrate: true },
    (err, results) => {
      if (err) return next(err);
      const searchOutput = processResults(results, tags);
      return res.send(searchOutput);
  });
}

export default {
  search
};
