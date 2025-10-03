export const formatFileName = (filePath, maxLength = 30) => {
  if (!filePath) return "Unknown File"

  
  let rawName = filePath.split("/").pop().split("\\").pop()

  
  rawName = fixEncoding(rawName)

  
  const cleanedName = rawName.replace(/^\d+[_-]?/, "")

  
  if (cleanedName.length <= maxLength) return cleanedName

  const ext = cleanedName.includes(".") ? cleanedName.split(".").pop() : ""
  const base = cleanedName.replace(`.${ext}`, "")

  const start = base.slice(0, 20)
  const end = base.slice(-10)

  return `${start}...${end}${ext ? "." + ext : ""}`
}


const fixEncoding = (str) => {
  try {
    return decodeURIComponent(escape(str)) 
  } catch {
    return str
  }
}


// helperfunctions.js

// Format time to AM/PM
export const formatTimeAMPM = (timeStr) => {
  if (!timeStr) return ""
  const [h, m, s] = timeStr.split(":").map(Number)
  const ampm = h >= 12 ? "PM" : "AM"
  const hour = h % 12 === 0 ? 12 : h % 12
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`
}

// Format file names
export const formatFile = (path) => {
  if (!path) return ""
  const parts = path.split("\\").pop().split("/").pop()
  return parts
}

// Get image URL
export const getImageUrl = (path) => {
  if (!path) return ""
  if (path.startsWith("http")) return path
  return `http://localhost:3024/${path.replace(/^\/?/, "")}`
}

// Get document URL
export const getDocumentUrl = (path) => {
  if (!path) return ""
  if (path.startsWith("http")) return path
  return `http://localhost:3024/${path.replace(/^\/?/, "")}`
}


export const parseLocations = (location) => {
  if (!location) return ""
  try {
    // Parse the JSON string
    const parsed = JSON.parse(location)
    // If it's an array, join with comma, else return as string
    return Array.isArray(parsed) ? parsed.join(", ") : parsed
  } catch (e) {
    // Fallback: return as-is
    return location
  }
}

