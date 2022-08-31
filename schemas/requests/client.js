
import * as Yup from "yup";


const schemas = {
  get: Yup.object().shape({
    params: Yup.object().shape({
      client_id: Yup.string()
    }),
    query: Yup.object().shape({
      user_id: Yup.string()
    })
  }),
  post: Yup.object().shape({
    body: Yup.object().shape({
      name: Yup.string()
        .required(),
      redirect_uri: Yup.string()
        .required()
        .url(),
      user_id: Yup.string()
    })
  }),
  patch: Yup.object().shape({
    params: Yup.object().shape({
      client_id: Yup.string()
        .required()
    }),
    body: Yup.lazy(value => (
      Array.isArray(value)
        ? Yup.array().of(
          Yup.object().shape({
            op: Yup.string()
              .required()
              .oneOf(["add", "remove", "replace", "move", "copy", "test"]),
            path: Yup.string()
              .required(),
            value: Yup.string(),
            from: Yup.string()
          })
        )
        : Yup.object().shape({
          name: Yup.string(),
          redirect_uri: Yup.string()
            .url(),
          user_id: Yup.string()
        })
    ))
  }),
  delete: Yup.object().shape({
    params: Yup.object().shape({
      client_id: Yup.string()
        .required()
    })
  })
};


export default schemas;
