import type { Awaitable } from "@vueuse/core";
import {
  computed,
  reactive,
  ref,
  toRef,
  unref,
  watch,
  type MaybeRef,
  type MaybeRefOrGetter,
  type Ref,
} from "vue";
import type { Form, FormDataDefault } from "../types/form";
import type { EntityPaths, PickEntity } from "../types/util";
import type { ValidationStrategy } from "../types/validation";
import { cloneRefValue } from "../utils/general";
import { useFieldRegistry } from "./useFieldRegistry";
import { useFormState } from "./useFormState";
import { createSubformInterface, type SubformOptions } from "./useSubform";
import { useValidation, type ValidationOptions } from "./useValidation";
import { useSubmitHandler } from "./useSubmitHandler";

export interface UseFormOptions<T extends FormDataDefault>
  extends ValidationOptions<T> {
  initialData: MaybeRefOrGetter<T>;
  validationStrategy?: MaybeRef<ValidationStrategy>;
  keepValuesOnUnmount?: MaybeRef<boolean>;
}

export function useForm<T extends FormDataDefault>(options: UseFormOptions<T>) {
  const initialData = computed(() => cloneRefValue(options.initialData));

  const data = ref<T>(cloneRefValue(initialData)) as Ref<T>;

  const state = reactive({
    initialData,
    data,
  });

  watch(
    initialData,
    (newValue) => {
      state.data = cloneRefValue(newValue);
    },
    { flush: "sync" },
  );

  const validationState = useValidation(state, options);
  const fieldRegistry = useFieldRegistry(state, validationState, {
    keepValuesOnUnmount: options.keepValuesOnUnmount,
    onBlur: async (path: string) => {
      if (unref(options.validationStrategy) === "onTouch") {
        validationState.validateField(path);
      }
    },
  });
  const formState = useFormState(fieldRegistry);

  const reset = () => {
    data.value = cloneRefValue(initialData);
    validationState.reset();
    for (const field of fieldRegistry.fields.value) {
      field.reset();
    }
  };

  function getSubForm<K extends EntityPaths<T>>(
    path: K,
    subformOptions?: SubformOptions<PickEntity<T, K>>,
  ): Omit<Form<PickEntity<T, K>>, "submitHandler"> {
    return createSubformInterface(formInterface, path, options, subformOptions);
  }

  const formInterface: Omit<Form<T>, "submitHandler"> = {
    ...fieldRegistry,
    ...validationState,
    ...formState,
    reset,
    getSubForm,
    initialData: toRef(state, "initialData") as Form<T>["initialData"],
    data: toRef(state, "data") as Form<T>["data"],
  };

  const submitHandler = useSubmitHandler(formInterface, options);

  if (unref(options.validationStrategy) === "onFormOpen") {
    validationState.validateForm();
  }

  return {
    ...formInterface,
    submitHandler,
  };
}
