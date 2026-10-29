export const create = async ({ model, data, option = {} } = {}) => {
  return await model.create([data], option);
};
export const findOne = async ({
  model,
  filter,
  projection,
  option = {},
} = {}) => {
  return await model.findOne(filter, projection, option);
};
export const find = async ({ model, filter, option = {} } = {}) => {
  const data = model.find(filter, option);
  if (option?.limit) {
    data.limit(option?.limit);
  }
  if (option?.sort) {data.sort(option?.sort);}
  if (option?.skip) {data.skip(option?.skip);}
  if (option?.populate) {data.populate(option?.populate);}
  return data.exec()
};

export const findById = async ({ model, id, option = {} } = {}) => {
  return await model.findById(id, option);
};
export const findByIdAndUpdate = async ({
  model,
  id,
  update,
  option = {},
} = {}) => {
  return await model.findByIdAndUpdate(id, update, {
    new: true,
    runvalidator: true,
    ...option,
  });
};
export const findOneAndUpdate = async ({
  model,
  filter,
  update,
  option = {},
} = {}) => {
  return await model.findOneAndUpdate(filter, update, {
    new: true,
    runvalidator: true,
    ...option,
  });
};
export const deleteMany = async ({ model, filter, option = {} } = {}) => {
  return await model.findOne(filter, option);
};
