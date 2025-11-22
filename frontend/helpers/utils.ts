const calculateCountdown = (dateString: string) => {
  const now = new Date();
  const raceDate = new Date(dateString);
  const diff = raceDate.getTime() - now.getTime();
  if (diff < 0) return null;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hours, minutes };
};




export {
    calculateCountdown
}
