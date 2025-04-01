
export default function Home() {

  const arr = [1, 2, 3, 4, 5,33];


  return (
    <div className="flex justify-center items-center min-h-screen">
      {arr.map((item, index) => (
        <div key={index}>{item}</div>
      ))}

      <p className="text-center">
        HEJ Oliver
      </p>
    </div> 
  );
}
