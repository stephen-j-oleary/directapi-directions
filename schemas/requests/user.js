
import * as Yup from "yup";


const schemas = {
  get: Yup.object().shape({
    query: Yup.object().shape({
      user_id: Yup.string()
    })
  }),
  post: Yup.object().shape({
    body: Yup.object().shape({
      email: Yup.string()
        .required()
        .email(),
      password: Yup.string()
        .required()
        .min(6),
      name: Yup.string()
        .required()
    })
  }),
  patch: Yup.object().shape({
    params: Yup.object().shape({
      user_id: Yup.string()
        .required()
    }),
    body: Yup.lazy(value =>
      Array.isArray(value)
        ? Yup.array().of(
          Yup.object().shape({
            op: Yup.string()
              .required()
              .oneOf(["add", "remove", "replace", "move", "copy", "test"]),
            path: Yup.string()
              .required(),
            value: Yup.mixed(),
            from: Yup.string()
          })
        )
        : Yup.object().shape({
          email: Yup.string()
            .email(),
          password: Yup.string()
            .min(6),
          name: Yup.string()
        })
    )
  }),
  delete: Yup.object().shape({
    params: Yup.object().shape({
      user_id: Yup.string()
        .required()
    })
  })
};


export default schemas;
