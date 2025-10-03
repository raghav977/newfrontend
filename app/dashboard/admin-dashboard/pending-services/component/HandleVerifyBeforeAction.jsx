const handleVerifyBeforeAction = (service, action) => {
  if (!service.provider?.is_verified) {
    setSelectedService(service)
    setPendingAction(action)
    setShowKycModal(true)
  } else {
    action === "approve" ? handleAccept(service) : handleRejectModal(service)
  }
}

const confirmKycAction = () => {
  setShowKycModal(false)
  if (pendingAction === "approve") {
    handleAccept(selectedService)
  } else if (pendingAction === "reject") {
    handleRejectModal(selectedService)
  }
}

export default handleVerifyBeforeAction