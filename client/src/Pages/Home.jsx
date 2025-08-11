export const Home = () => {
    return (
        <div className="container mx-auto p-4 flex">
            <div className="flex-1 flex flex-col items-center justify-start ml-4">
                <h1 className="text-2xl font-bold mb-4">Welcome to the Clinic Management System</h1>
                <p className="text-gray-600">
                    This is a simple application to manage clinic appointments and patient records.
                </p>
            </div>
        </div>
    );
}