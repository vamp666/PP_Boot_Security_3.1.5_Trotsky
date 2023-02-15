package ru.kata.spring.boot_security.demo.controller;

import ru.kata.spring.boot_security.demo.entity.User;
import ru.kata.spring.boot_security.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import java.security.Principal;

@Controller
public class UserController {

    @Autowired
    UserService userService;

    @RequestMapping(value = {("/login"), ("/index"), ("/")})
    public String login(Model model) {
        return "/login";
    }

    @GetMapping(value = "/user")
    public String getUserPage(Model model, Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        model.addAttribute("user", user);
        return "/user";
    }
}
