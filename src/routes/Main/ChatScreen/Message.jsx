import { useForm } from "react-hook-form";


const Message = () => {

  const { register, handleSubmit } = useForm();

  const onSubmit = ({message}) => {

  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Type here..." {...register('message', { required: true })}></input>
    </form>




  )
}

export default Message;