import type { Form, FormDataDefault, FormField } from "../types/form";
import type { Paths, PickProps } from "../types/util";

export function useFieldArray<T extends FormDataDefault, K extends Paths<T>>(
  form: Form<T>,
  path: PickProps<T, K> extends unknown[] ? K : never,
) {
  type Items = PickProps<T, K> & unknown[];
  type Item = Items[number];
  const arrayField = form.getField(path) as FormField<Items, K>;

  const push = (item: Item) => {
    arrayField.setData([...arrayField.data.value, item] as Items);
  };
}
