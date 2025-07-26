import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signup } from "../lib/api";

const useSignup = () => {
    const queryClient = useQueryClient();

    const { mutate, isPending, error} = useMutation({
      mutationFn: signup,
      
      // Making sure that authUser is updated
      onSuccess: () => {
        queryClient.invalidateQueries({
          queryKey: ["authUser"]
        })
      }
    })

    return {error, isPending, signupMutation: mutate}
}

export default useSignup