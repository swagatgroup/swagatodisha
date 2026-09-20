const fs = require('fs');
const file = 'frontend/src/components/dashboard/DashboardLayout.jsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Mobile Sidebar addition
const mobileNavEnd = `                                    ))}
                                </nav>
                                
                            </div>
                        </motion.div>`;

const mobileNavWithLogout = `                                    ))}
                                </nav>
                                <div className="mt-auto px-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        onTouchEnd={handleLogout}
                                        className="group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer"
                                    >
                                        <ArrowRightOnRectangleIcon className="flex-shrink-0 h-6 w-6" />
                                        <span className="ml-3">Sign Out</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>`;

content = content.replace(mobileNavEnd, mobileNavWithLogout);

// 2. Desktop Sidebar addition
const desktopNavEnd = `                                    ))}
                                </nav>
                                
                            </div>
                        </div>
                    </div>
                </div>`;

const desktopNavWithLogout = `                                    ))}
                                </nav>
                                <div className="mt-auto px-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        onTouchEnd={handleLogout}
                                        className={\`group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer \${sidebarCollapsed ? 'justify-center' : ''}\`}
                                    >
                                        <ArrowRightOnRectangleIcon className="flex-shrink-0 h-6 w-6" />
                                        {!sidebarCollapsed && <span className="ml-3">Sign Out</span>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>`;

content = content.replace(desktopNavEnd, desktopNavWithLogout);

fs.writeFileSync(file, content);
