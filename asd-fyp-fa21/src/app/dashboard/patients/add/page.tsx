import AddPatientForm from "./add-patient-form";

export default function AddPatient() {
  return (
    <>
      <div className="py-10 mx-auto max-w-[1200px]">
        <p className="text-2xl font-bold mb-14">Add Patient</p>
        <div className="bg-[#0f0f0f] p-5 rounded-xl">
          <AddPatientForm />
        </div>
      </div>
    </>
  );
}
