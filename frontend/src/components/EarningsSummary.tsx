interface EarningsSummaryProps {
  totalDeposited?: number
  totalInterests?: number
}

export default function EarningsSummary({ 
  totalDeposited = 7000, 
  totalInterests = 310 
}: EarningsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-sm text-gray-600 mb-2">Total Depositado</p>
        <p className="text-3xl font-bold text-green-600">
          ${totalDeposited.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </p>
      </div>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-sm text-gray-600 mb-2">Intereses Ganados</p>
        <p className="text-3xl font-bold text-green-600">
          +${totalInterests.toLocaleString('en-US', { 
            minimumFractionDigits: 2, 
            maximumFractionDigits: 2 
          })}
        </p>
      </div>
    </div>
  )
}
