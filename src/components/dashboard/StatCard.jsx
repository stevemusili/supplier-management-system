function StatCard ({ title, value }) {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="items-center">
                <h3 className="text-sm font-medium text-gray-500">
                    {title}
                </h3>

                <p className="mt-4 text-3xl font-bold text-gray-800">
                    {value}
                </p>
            </div>
        </div>
    )
}

export default StatCard;