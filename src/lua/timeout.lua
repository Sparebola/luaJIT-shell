local queue = {}
Tasking = {
	wait = function(time) coroutine.yield(time / 1000) end
}

local function halt(self)
	self.halted = true
end

local function resume(self)
	self.halted = false
end

function Tasking.new(f, halted)
	if halted == nil then halted = false end
	local current_time = os.clock()
	local task = { 
		f = coroutine.create(f), 
		wake_time = current_time, halted = halted, 
		halt = halt, 
		resume = resume
	}
	table.insert(queue, task)
	return queue[#queue]
end

local BREAK = false
Tasking.new(function()
    print(1)
    Tasking.wait(1000)
    print(2)
    BREAK = true
end)

while not BREAK do
	for idx, task in pairs(queue) do
		if task.wake_time < os.clock() and not task.halted then
			if coroutine.status(task.f) == 'dead' then
				queue[idx] = nil
			else
				local resumed, result = coroutine.resume(task.f)
				if not resumed then
					error(result, 2)
				elseif result ~= nil then
					task.wake_time = os.clock() + result
				end
			end
		end
	end
end