import { useForm } from "react-hook-form";


const Message = () => {

  const { register, handleSubmit, resetField } = useForm();

  const onSubmit = ({message}) => {
    resetField('message');
    console.log(message);



  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input placeholder="Type here..." {...register('message', { required: true, maxLength: 200})}></input>

    </form>




  )
}

export default Message;