

const agentMiddleware=(req,res,next)=>{
    if (req.user && req.user.role === "agent") {
    next(); // user is agent, allow access
  } else {
    res.status(403).json({ message: "Agent access only" });
  }

}
module.exports = agentMiddleware;